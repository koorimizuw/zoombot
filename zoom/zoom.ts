import { Builder, By, Key, until, WebDriver, WebElement } from "selenium-webdriver";
import logger from "../logger.js";
import {
  inputPasscodeSelector,
  menuSelector,
  chatTitleSelector,
  chatOpenSelector,
  chatBoxSelector,
  chatInputSelector,
  userBoxTitleSelector,
  userOpenSelector
} from "./selector"

const loggerName = `[Main/Zoom] ` as const;

export type ZoomConfig = {
  joinUrl?: string;
  name: string;
  email: string;
  meetingId: string;
  meetingPassword: string;
  readonly driver: "chrome";
}

export type ZoomContext = WebDriver;

export async function joinZoom(
  name: string,
  config: ZoomConfig
): Promise<ZoomContext> {
  const driver = await new Builder()
    .forBrowser(config.driver)
    .build();

  const url = createUrl(config);
  await driver.get(url);
  await driver
    .findElement(By.name("inputname"))
    .sendKeys(config.name, Key.RETURN);
  await driver.wait(
    until.urlMatches(/^https:\/\/zoom\.us\/wc\/\d+\/join/),
    1000);

  try {
    while (true) {
      await driver.wait(until.elementLocated(By.css(inputPasscodeSelector)));
      const passwordInput = await driver.findElements(
        By.name("inputpasscode")
      );
      if (passwordInput.length !== 0) {
        await passwordInput[0].sendKeys(
          config.meetingPassword,
          Key.RETURN
        );
      } else {
        break;
      }
    }
  } catch (error) {
    logger.debug(loggerName + `Join metting failed.`);
    driver.quit()
  }

  return driver
}

export async function leaveZoom(ctx: ZoomContext) {
  ctx.quit()
}

export async function openZoomMenu(ctx: ZoomContext) {
  await ctx.executeScript(menuSelector);
}

export async function openZoomChat(ctx: ZoomContext) {
  const chatTitle = await ctx.findElements(By.className(chatTitleSelector))
  if (chatTitle.length !== 0) { return; }

  await ctx.wait(until.elementLocated(By.css(chatOpenSelector)));
  await ctx
    .findElement(By.css(chatOpenSelector))
    .click();
}

export async function openZoomUserList(ctx: ZoomContext) {
  const userBoxTitle = await ctx.findElements(By.className(userBoxTitleSelector))
  if (userBoxTitle.length !== 0) { return; }

  await ctx.wait(until.elementLocated(By.xpath(userOpenSelector)));
  await ctx
    .findElement(By.xpath(userOpenSelector))
    .click();
}

export async function fetchMessageList(ctx: ZoomContext) {
  const messages = await ctx.findElements(By.className(chatBoxSelector));
  return await Promise.all(
    messages.map(async (message) => {
      return await message.getText();
    })
  );
}

export async function getActiveUserCounts(ctx: ZoomContext) {
  const userBoxTitle = await ctx.findElements(By.className(userBoxTitleSelector))
  const title = await userBoxTitle[0].getText()
  const search = /[1-9]+/g.exec(title)
  if (search) {
    return Number(search[0])
  }
  return 0
}

export async function sendChatMessage(
  ctx: ZoomContext,
  message: Parameters<WebElement["sendKeys"]>[number]
) {
  await ctx.wait(until.elementLocated(By.className(chatInputSelector)));
  await ctx
    .findElement(By.className(chatInputSelector))
    .sendKeys(message, Key.RETURN);
}

const createUrl = (config: ZoomConfig) => {
  return config.joinUrl ?? "https://zoom.us/wc/join/" + config.meetingId;
}
