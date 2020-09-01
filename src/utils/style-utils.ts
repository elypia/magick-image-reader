/*
 * Copyright 2020-2020 Elypia CIC and Contributors (https://gitlab.com/Elypia/magick-image-reader/-/graphs/master)
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
  * @since 0.4.0
  */
export class StyleUtils {

  /**
   * Finds the style tag and appends the ruleset to the end of it.
   *
   * @param ruleset The new ruleset that should be appended to the end of the stylesheet.
   * @param html The source HTML document.
   * @returns A copy of the HTML document with the ruleset added.
   */
  public static appendStyleToHtml(ruleset: string, html: string): string {
    let index = html.lastIndexOf('</style>');
    return html.slice(0, index) + ruleset + html.slice(index);
  }

  /**
   * Convert a JSON object to a valid CSS formatted
   * set of style rulesets.
   *
   * @param properties A JSON object that represents CSS properties to convert.
   * @returns A string that joins all of the properties together, formatted like CSS properties.
   */
  public static convertToCssProperties(properties: any): string {
    let css: string = '';

    for (const property in properties)
      css += `${property}:${properties[property]};`

    return css;
  }

  /**
   * @param selector The selector name for this ruleset.
   * @param css The styles that should be applied to selected elements.
   * @returns The CSS ruleset wrapped in a selector.
   */
  public static createCssRuleset(selector: string, css: string) {
    return `${selector}{${css}}`;
  }

  /**
   * Shortcut to call both convertToCssProperties, and createCssRuleset.
   *
   * @param selector The selector name for this ruleset.
   * @param properties A JSON object that represents CSS properties to convert.
   * @returns The CSS ruleset wrapped in a selector.
   */
  public static convertToCssRuleset(selector: string, properties: any): string {
    const css = this.convertToCssProperties(properties);
    return this.createCssRuleset(selector, css);
  }
}
