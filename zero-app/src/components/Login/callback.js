import React, { Component } from 'react'
import instance from '../Api/api';
import {Container} from '@chakra-ui/react';
class Callback extends Component {
    state = {  
      mounted: false
    } 
    async componentDidMount() {
      if (!this.state.mounted) {
        // fetch the access token from the url 
        const url = window.location.href; 
        const hasCode = url.includes("?code="); 
        if (hasCode) { 
            const newUrl = url.split("?code="); 
            window.history.pushState({}, null, newUrl[0]);
            const code = newUrl[1];
            console.log(code); 
        // // fetch the access token from the backend
        try {
            await instance({
              url: '/callback-code?code='+code,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }).then(res => { 
              console.log(res.data);      
            localStorage.setItem('_zero_token', res.data['RESPONSE'].gh_token);
            localStorage.setItem('_zero_user', res.data['RESPONSE'].gh_user);
            this.setState({ mounted: true });
            window.location.href="/"
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    render() { 
        return (
            <Container>
Authorizing.... Dont close the tab you will be redirected
            </Container> 
        );
    }
}
 
export default Callback;