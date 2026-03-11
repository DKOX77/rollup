const assert = require('node:assert');

const resolvedPhases = {};

module.exports = defineTest({
	description:
		'passes the correct import phase to the resolveId hook and allows plugins to mark source phase imports as external',
	options: {
		output: { format: 'es' },
		plugins: [
			{
				name: 'phase-checker',
				resolveId(source, _importer, { phase, isEntry }) {
					if (isEntry) return null;
					resolvedPhases[source] = phase;
					if (phase === 'source') {
						return { id: source, external: true };
					}
					if (source === 'my-regular-module') {
						return { id: source, external: true };
					}
				}
			}
		]
	},
	runtimeError(error) {
		// ES module output cannot be executed in a CJS test context; ignore the
		// SyntaxError and only assert on the resolved phases collected during build.
		assert.ok(error instanceof SyntaxError, `Unexpected error: ${error.message}`);
	},
	after() {
		assert.deepStrictEqual(resolvedPhases, {
			'my-wasm-module': 'source',
			'my-regular-module': 'evaluation'
		});
	}
});
