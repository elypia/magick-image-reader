/*
 * Copyright 2020-2020 Elypia CIC and Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @since 1.0.0
*/
import { WebviewEventType } from "./webview-event-type";

/**
 * This extension uses a strict format when sending
 * or receiving events from the webview to the extension.
 */
export interface WebviewEvent {

  /** The type of event that's taken place. */
  type: WebviewEventType;

  /** 
   * The value associated with the event. 
   * This could be anything as it comes from the JavaScript portion
   * of the code so it should be validated.
   */
  value?: unknown;
}
