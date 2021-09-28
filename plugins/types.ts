import { ZoomContext } from "../zoom"
export type PluginConfig = {
  regex: RegExp;
  message: string;
}
export interface BasePlugin extends PluginConfig {
  name: string;
  zoomContext: ZoomContext;
  running: boolean;
  run(): Promise<void>
}
export type PluginContext = {
  name: string;
  plugin: BasePlugin;
  config: PluginConfig
}