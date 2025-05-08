import { DEFAULT_WAIT_TIME } from "../utils/init";
import { waitForElementVisible } from "./components/ElementUtil";

export default class BaseScreen {
  screenId: string;
  
  constructor(screenId: string){
    this.screenId = screenId;
  }

  async waitForScreenVisible(timeout?: number) {
    return waitForElementVisible(element(by.id(this.screenId)), timeout? timeout: DEFAULT_WAIT_TIME, 1);
  }
}