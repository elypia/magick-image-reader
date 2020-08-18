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
 * Interpolate a set of variables into {@link string}s
 * 
 * @since 1.0.0
 */
export class Interpolator {

  public constructor(private readonly variables: Map<string, string>) {
    this.variables = variables;
  }

  /**
   * Interpolates all instances of ${variables} in the string provided.
   * 
   * @param body The body to interpolate, returns with no changes
   * if there are no known elements to replace.
   * @returns The body parameter but with any variables replaced for 
   * actual values.
   */
  public interpolate(body: string): string {
    let result: string = body;

    this.variables.forEach((value: string, key: string) => {
      console.log(`Replacing all instances of "${key}" with "${value}".`);
      const pattern: RegExp = new RegExp(`\\\${${key}}`, 'g');
      result = result.replace(pattern, value);
    });

    return result;
  }
}