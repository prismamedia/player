export default {
	coverageDirectory: 'coverage',
	coveragePathIgnorePatterns: ['<rootDir>/dist'],
	moduleFileExtensions: ['js', 'ts', 'css'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1', // Fix for Jest: ".js" extensions is used in TypeScript files
		'^@src(.*)$': '<rootDir>/src$1'
	},
	modulePaths: ['<rootDir>/src'],
	resetModules: true,
	rootDir: '../',
	testEnvironment: 'jsdom',
	testMatch: ['<rootDir>/tests/*.test.js'],
	transform: {
		'^.+\\.(ts|js)$': 'ts-jest'
	},
	verbose: true,
	reporters: ['default', 'jest-junit'],
	resetMocks: true,
	clearMocks: true
}
