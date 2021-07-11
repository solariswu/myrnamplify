/**
 * @format
 */

import Amplify from '@aws-amplify/core'
import awsconfig from './src/aws-exports'
Amplify.configure(awsconfig)

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
