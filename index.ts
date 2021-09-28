import config from "./config.js";
import { joinZoom } from "./zoom";
import logger from "./logger.js";

async function start() {
  for (const meeting of config) {
    const loggerName = `[Main/${meeting.name}] `;
    // TODO: cron

    logger.debug(loggerName + `Join metting...`);
    const zoomContext = await joinZoom(meeting.name, meeting.zoomConfig);
    logger.info(loggerName + `Successfully joined meeting`);

    for (const pluginConfig of meeting.plugins) {
      const plugin = new pluginConfig.plugin(
        meeting.name,
        zoomContext,
        pluginConfig.config
      );
      logger.debug(loggerName + `Created ${pluginConfig.name}`);
      const pluginPromise = plugin.run();
      logger.info(loggerName + `Started ${pluginConfig.name}`);

      pluginPromise
        .then(() => {
          if (plugin.running) {
            logger.warn(
              loggerName + `${pluginConfig.name} terminated unexpectedly`
            );
          } else {
            logger.info(
              loggerName + `${pluginConfig.name} terminated successfully`
            );
          }
        })
        .catch((e: Error) => {
          logger.error(
            loggerName + `${pluginConfig.name} terminated with exception`
          );
          logger.error(e);
        });
    }
  }
}

start();
