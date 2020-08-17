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
 * Used to generate random strings which can be used for
 * validation purposes later.
 */
export class Nonce {

	/** The number of characters the nonce can be. */
	private static readonly nonceLength: number = 32;

	/** The minimum ascii table from the ascii table to add. */
	private static readonly minimum: number = 97;

	/** How many points from the initial minimum are allowed. */
	private static readonly maximumOffset: number = 26;

	/**
	 * @returns A generated long string made up of a-z characters.
	 */
	public static generate(): string {
		let result: string = '';

		for (let i = 0; i < this.nonceLength; i++) {
			const byte: number = Math.floor(Math.random() * this.maximumOffset) + this.minimum;
			result += String.fromCharCode(byte);
		}
	
		console.log('Generated nonce of:', result);
		return result;
	}
}
