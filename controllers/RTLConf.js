var ini = require('ini');
var path = require('path');
var fs = require('fs');
var logger = require('./logger');
var common = require('../common');

exports.getRTLConfig = (req, res, next) => {
  var RTLConfFile = common.rtl_conf_file_path + '/RTL.conf';
  logger.info('\r\nConf: 7: ' + JSON.stringify(Date.now()) + ': INFO: Getting RTL Config');
  fs.readFile(RTLConfFile, 'utf8', function(err, data) {
    if (err) {
      logger.error('\r\nConf: 10: ' + JSON.stringify(Date.now()) + ': ERROR: Getting RTL Config Failed!');
      res.status(500).json({
        message: "Reading RTL Config Failed!",
        error: err
      });
    } else {
      const jsonConfig = ini.parse(data);
      authSettings = {
        nodeAuthType: common.node_auth_type,
        lndConfigPath: common.lnd_config_path,
        bitcoindConfigPath: common.bitcoind_config_path,
        rtlSSO: common.rtl_sso,
        logoutRedirectLink: common.logout_redirect_link
      };
      res.status(200).json({settings: jsonConfig.Settings, authSettings: authSettings});
    }
  });
};

exports.updateUISettings = (req, res, next) => {
  var RTLConfFile = common.rtl_conf_file_path + '/RTL.conf';
  var config = ini.parse(fs.readFileSync(RTLConfFile, 'utf-8'));
  delete config.Settings;
  fs.writeFileSync(RTLConfFile, ini.stringify(config));
  fs.appendFile(RTLConfFile, ini.stringify(req.body.updatedSettings, { section: 'Settings' }), function(err) {
    if (err) {
      logger.error('\r\nConf: 28: ' + JSON.stringify(Date.now()) + ': ERROR: Updating UI Settings Failed!');
      res.status(500).json({
        message: "Updating UI Settings Failed!",
        error: 'Updating UI Settings Failed!'
      });
    } else {
      logger.info('\r\nConf: 34: ' + JSON.stringify(Date.now()) + ': INFO: Updating UI Settings Succesful!');
      res.status(201).json({message: 'UI Settings Updated Successfully'});
    }
  });
};

exports.getConfig = (req, res, next) => {
  let confFile = '';
  switch (req.params.nodeType) {
    case 'lnd':
      confFile = common.lnd_config_path
      break;
    case 'bitcoind':
      confFile = common.bitcoind_config_path
      break;
    case 'rtl':
      confFile = common.rtl_conf_file_path + '/RTL.conf';
      break;
    default:
      confFile = '';
      break;
  }
  logger.info('\r\nConf: 43: ' + JSON.stringify(Date.now()) + ': INFO: Node Type: ' + req.params.nodeType + ', File Path: ' + confFile);
  fs.readFile(confFile, 'utf8', function(err, data) {
    if (err) {
      logger.error('\r\nConf: 59: ' + JSON.stringify(Date.now()) + ': ERROR: Reading Conf Failed!');
      res.status(500).json({
        message: "Reading Config File Failed!",
        error: err
      });
    } else {
      const jsonConfig = ini.parse(data);
      if (undefined !== jsonConfig.Authentication && undefined !== jsonConfig.Authentication.rtlPass) {
        jsonConfig.Authentication.rtlPass = jsonConfig.Authentication.rtlPass.replace(/./g, '*');
      }
      if (undefined !== jsonConfig.Bitcoind && undefined !== jsonConfig.Bitcoind['bitcoind.rpcpass']) {
        jsonConfig.Bitcoind['bitcoind.rpcpass'] = jsonConfig.Bitcoind['bitcoind.rpcpass'].replace(/./g, '*');
      }
      res.status(200).json(ini.stringify(jsonConfig));
    }
  });
};

exports.getMultiNodeConfig = (req, res, next) => {
  var RTLMultiNodeConfFile = common.rtl_conf_file_path + '/RTL-Multi-Node-Conf.json';
  logger.info('\r\nRTLConf.js: 91: ' + JSON.stringify(Date.now()) + ': INFO: Getting Multi Node Config');
  fs.readFile(RTLMultiNodeConfFile, 'utf8', function(err, data) {
    if (err) {
      logger.error('\r\nRTLConf.js: 94: ' + JSON.stringify(Date.now()) + ': ERROR: Getting Multi Node Config Failed!');
      res.status(500).json({
        message: "Reading Multi Node Config Failed!",
        error: err
      });
    } else {
      const multiNodeConfig = require('../RTL-Multi-Node-Conf.json');
        var nodeinfo = [];
        for(var key in multiNodeConfig)
          nodeinfo.push({"Index":multiNodeConfig[key].Index, "LNNode":multiNodeConfig[key].LNNode, "LNImpl":multiNodeConfig[key].LNImplementation});
      res.status(200).json({nodes:nodeinfo});
    }
  });
};