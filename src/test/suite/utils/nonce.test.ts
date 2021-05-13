import * as assert from 'assert';
import { Nonce } from '../../../utils/nonce';

suite('nonce.ts', () => {

  test('Generates without exception', () => {
    assert.doesNotThrow(() => Nonce.generate());
  });

  test('Generates correct length', () => {
    assert.strictEqual(128, Nonce.generate().length);
    assert.strictEqual(64, Nonce.generate(64).length);
  });
});
