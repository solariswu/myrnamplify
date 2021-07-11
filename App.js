// @flow
import React, {Component} from 'react';
import {StyleSheet, Text, View, Alert, Button} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import type {User} from '@react-native-google-signin/google-signin';
import config from './config'; // see docs/CONTRIBUTING.md for details

import {Auth} from '@aws-amplify/auth';
import {API} from '@aws-amplify/api';
import {graphqlOperation} from '@aws-amplify/api-graphql';
import {updateMycounter} from './src/graphql/mutations';
import {listMycounters} from './src/graphql/queries';

type ErrorWithCode = Error & {code?: string};

type State = {
  error: ?ErrorWithCode,
  userInfo: ?User,
};

class App extends Component<{}, State> {
  state = {
    userInfo: null,
    error: null,
    counter: null,
  };

  async _increaseCounter() {
    try {
      let counter = this.state.counter;
      counter.value = counter.value + 1;
      this.setState(counter);
      await API.graphql(graphqlOperation(updateMycounter, {input: counter}));
    } catch (err) {
      console.log('error increasing counter', err);
    }
  }

  async _getCounter() {
    try {
      const counterData = await API.graphql(graphqlOperation(listMycounters));
      console.log('counterData', counterData);
      const counterItem = counterData.data.listMycounters.items[0];
      const counter = {id: counterItem.id, value: counterItem.value};
      this.setState({counter});
    } catch (err) {
      console.log('error fetching counter', err);
    }
  }

  async componentDidMount() {
    this._configureGoogleSignIn();
    GoogleSignin.isSignedIn()
      .then(isSignedIn => {
        console.log('isSignedIn:', isSignedIn);
        if (isSignedIn) {
          return this._getCurrentUser();
        }
        else {
          return Promise.resolve();
        }
      })
      .then(() => {
        console.log('getCurrentUser, try to update credentials');
        return this._updateCredential();
      })
      .then(() => {
        return this._getCounter();
      });
  }

  _configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: config.webClientId,
      offlineAccess: false,
    });
  }

  async _updateCredential() {
    console.log('update currentCred...');
    return Auth.federatedSignIn(
      'google',
      {
        token: this.state.userInfo.idToken,
      },
      this.state.userInfo.User,
    );
  }

  async _getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({userInfo, error: null});
      console.log('userInfo:', userInfo.user.email);
      return Promise.resolve();
    } catch (error) {
      const errorMessage =
        error.code === statusCodes.SIGN_IN_REQUIRED
          ? 'Please sign in :)'
          : error.message;
      this.setState({
        error: new Error(errorMessage),
      });
      return Promise.reject();
    }
  }

  render() {
    const {userInfo} = this.state;

    const body = userInfo
      ? this.renderUserInfo(userInfo)
      : this.renderSignInButton();
    return (
      <View style={[styles.container, styles.pageContainer]}>
        {this.renderCounter()}
        {body}
      </View>
    );
  }

  renderCounter() {
    return (
      <View style={styles.container}>
        <Text>
          Counter {this.state.counter ? this.state.counter.value : '...'}
        </Text>
        <Text>{this.state.counter ? this.renderCounterButton() : ''}</Text>
      </View>
    );
  }

  renderCounterButton() {
    return (
      <Button
        onPress={async () => {
          await this._increaseCounter();
        }}
        title="increase counter"
      />
    );
  }
  
  renderUserInfo(userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.userInfo}>Welcome {userInfo.user.name}</Text>
        <Text>Your google id: {JSON.stringify(userInfo.user.id)}</Text>
        <Text> </Text>

        <Button onPress={this._signOut} title="Log out" />
        {this.renderError()}
      </View>
    );
  }

  renderSignInButton() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Auto}
          onPress={this._signIn}
        />
        {this.renderError()}
      </View>
    );
  }

  renderError() {
    const {error} = this.state;
    if (!error) {
      return null;
    }
    const text = `${error.toString()} ${error.code ? error.code : ''}`;
    return <Text>{text}</Text>;
  }

  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({userInfo, error: null});

      Auth.federatedSignIn(
        'google',
        {
          token: userInfo.idToken,
          // expires_at: expiresIn * 1000 + new Date().getTime(), // the expiration timestamp
        },
        userInfo.user,
      )
        .then(cred => {
          // If success, you will get the AWS credentials
          console.log('signIn, cred:', cred.accessKeyId);
          return Auth.currentAuthenticatedUser({bypassCache: true});
        })
        .then(user => {
          // If success, the user object you passed in Auth.federatedSignIn
          console.log('amplify auth user: ', user);
          return this._getCounter();
        })
        .catch(e => {
          console.log(e);
        });
    } catch (error) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // sign in was cancelled
          Alert.alert('cancelled');
          break;
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          Alert.alert('in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          Alert.alert('play services not available or outdated');
          break;
        default:
          Alert.alert('Something went wrong', error.toString());
          this.setState({
            error,
          });
      }
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await Auth.signOut();
      await Auth.Credentials.clear();

      this.setState({userInfo: null, error: null, counter: null});
    } catch (error) {
      this.setState({
        error,
      });
    }
  };
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  userInfo: {fontSize: 18, fontWeight: 'bold', marginBottom: 20},
  pageContainer: {flex: 1},
});

export default App;
// AppRegistry.registerComponent('GoogleSigninSampleApp', () => GoogleSigninSampleApp);
