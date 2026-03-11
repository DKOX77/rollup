const assert = require('node:assert');
const path = require('node:path');

const importer = path.join(__dirname, 'main.js');
const receivedPhases = {};

module.exports = defineTest({
	description:
		'forwards the phase option from this.resolve() in buildStart to the resolveId hook of other plugins',
	options: {
		plugins: [
			{
				name: 'resolver',
				buildStart() {
					return Promise.all([
						this.resolve('my-source-module', importer, { phase: 'source' }),
						this.resolve('my-eval-module', importer, { phase: 'evaluation' }),
						this.resolve('my-default-module', importer)
					]);
				}
			},
			{
				name: 'phase-recorder',
				resolveId(source, _importer, { phase, isEntry }) {
					if (isEntry) return null;
					receivedPhases[source] = phase;
					return { id: source, external: true };
				}
			}
		]
	},
	after() {
		assert.deepStrictEqual(receivedPhases, {
			'my-source-module': 'source',
			'my-eval-module': 'evaluation',
			'my-default-module': 'evaluation'
		});
	}
});
