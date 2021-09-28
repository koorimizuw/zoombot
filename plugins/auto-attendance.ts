import Timeout from "await-timeout";
import { BasePlugin } from "./types";
import logger from "../logger.js";
import {
  ZoomContext,
  openZoomMenu,
  openZoomChat,
  openZoomUserList,
  fetchMessageList,
  getActiveUserCounts,
  leaveZoom
} from "../zoom";
import { PluginConfig } from "./types"


class AutoAttendance implements BasePlugin {
  name: string;
  zoomContext: ZoomContext;
  running: boolean;
  regex: RegExp;
  message: string;
  checkInterval: number;
  timeoutBeforeMessage: number;
  maxUserCount: number;
  constructor(name: string, zoomContext: ZoomContext, { regex, message }: PluginConfig) {
    this.name = name
    this.zoomContext = zoomContext
    this.running = true
    this.regex = regex
    this.message = message
    this.checkInterval = 5000
    this.timeoutBeforeMessage = 0
    this.maxUserCount = 0
  }

  async run() {
    const loggerName = `[AutoAttendance/${this.name}] `;

    while (this.running) {
      try {
        await openZoomMenu(this.zoomContext);
        await openZoomChat(this.zoomContext);
        await openZoomUserList(this.zoomContext);

        const fetchedMessages = await fetchMessageList(this.zoomContext);
        logger.debug(loggerName + "Fetched message list: ", fetchedMessages);

        const activeUsersCounts = await getActiveUserCounts(this.zoomContext);
        logger.debug(loggerName + "Get active user counts: " + String(activeUsersCounts));

        this.maxUserCount = Math.max(this.maxUserCount, activeUsersCounts)
        if (activeUsersCounts < Math.ceil(this.maxUserCount / 2)) {
          logger.debug(loggerName + "Leave metting...");
          await leaveZoom(this.zoomContext);
          break
        }
        /*
        await this.zoomContext.runExclusive(async () => {
          await this.zoomContext.openMenu();
          await this.zoomContext.openChat();
          const fetchedMessages = await this.zoomContext.fetchMessageList();
          logger.debug(loggerName + "Fetched message list: ", fetchedMessages);

          for (const message of fetchedMessages) {
            if (message.match(this.regex)) {
              logger.debug(
                loggerName + "Regex has been matched in message: " + message
              );

              
              if (this.config.timeoutBeforeMessage) {
                await Timeout.set(this.config.timeoutBeforeMessage);
              }
              this.zoomContext.sendChatMessage(this.config.message);
              logger.info(loggerName + "Sent attendance message");

              //this.running = false
              //break
            }
          }
        });*/
      } catch (e) {
        console.log(e);
      }
      await Timeout.set(this.checkInterval);
    }
  }
}

export default AutoAttendance;
