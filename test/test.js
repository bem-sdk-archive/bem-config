var mock = require('mock-fs'),
    path = require('path'),
    expect = require('chai').expect,
    config = require('..'),
    localConfigName = config.getConfigName() + '.json',
    globalConfigName = config.getConfigName(true) + '.json',
    findConfigPath = require.resolve('find-config'),
    osHomedirPath = require.resolve('os-homedir'),
    tilde = require(osHomedirPath)(),
    globalConfigPath = path.resolve(tilde, globalConfigName),
    localConfigPath = path.resolve(process.cwd(), localConfigName),
    localDirName = path.dirname(localConfigPath);

    require(findConfigPath);

describe('bem-config tests', function() {

    afterEach(function () {
        mock.restore();
    });

    it('should return config name', function() {
        expect('bemconf').eql(config.getConfigName());
    });

    it('should return config file', function() {
        expect('bemconf.json').eql(config.getConfigFile());
    });

    it('should return global config name', function() {
        expect(path.resolve(tilde, '.bemconf.json')).eql(config.getGlobalConfigPath());
    });

    it('should return empty configs', function() {
        mock({});

        expect({
            global: {},
            local: {},
            extended: {}
        }).eql(config());
    });

    it('should return global config', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: {},
            extended: { GLOBAL: '1' }
        }).eql(config());
    });

    it('should respect local config', function() {
        var scheme = {};

        scheme[localConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';

        mock(scheme);
        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '1', LOCAL: '1', root: localDirName }
        }).eql(config());
    });

    it('should override config with option argument', function() {
        var scheme = {};
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = '{ "LOCAL": "1", "root": true }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: localDirName },
            extended: { GLOBAL: '1', LOCAL: '1', OPTION: '1', root: localDirName }
        }).eql(config({ OPTION: '1'}));
    });

    it('should find config a level directory up', function() {
        var scheme = {},
            newLocalDirName = path.dirname(path.resolve('..', localConfigName));
        scheme[globalConfigPath] = '{ "GLOBAL": "1" }';
        scheme[localConfigPath] = ''; // delete config in cwd
        scheme[path.resolve('..', localConfigName)] = '{ "LOCAL": "1", "root": true }';
        mock(scheme);

        expect({
            global: { GLOBAL: '1' },
            local: { LOCAL: '1', root: newLocalDirName },
            extended: { GLOBAL: '1', LOCAL: '1', OPTION: '1', root: newLocalDirName }
        }).eql(config({ OPTION: '1'}));
    });
});
