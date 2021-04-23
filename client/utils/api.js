import axios from "axios";

axios.defaults.timeout = 100000;
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL|| 'http://localhost:5000';

/**
* http request 
*/
axios.interceptors.request.use(
  (config) => {
    config.data = JSON.stringify(config.data);
    config.withCredentials = true
    config.headers = {
      "Content-Type": "application/json",
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
/**
* http response 
*/
axios.interceptors.response.use(
  (response) => {
    if (response.data.errCode === 2) {
      console.log("timeout");
    }
    return response;
  },
  (error) => {
    console.log("error: ", error);
  }
);

/**
* get method
* @param url  
* @param params  
* @returns {Promise}
*/
export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
        params: params,
      }).then((response) => {
        landing(url, params, response.data);
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
* post method
* @param url
* @param data
* @returns {Promise}
*/

export function post(url, data) {
  return new Promise((resolve, reject) => {
    axios.post(url, data).then(
      (response) => {
        // turn off prograss bar here
        resolve(response.data);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

export default function api(fecth, url, param) {
  let _data = "";
  return new Promise((resolve, reject) => {
    switch (fecth) {
      case "get":
        console.log("begin a get request,and url:", url);
        get(url, param)
          .then(function (response) {
            resolve(response);
          })
          .catch(function (error) {
            console.log("get request GET failed.", error);
            reject(error);
          });
        break;
      case "post":
        post(url, param)
          .then(function (response) {
            resolve(response);
          })
          .catch(function (error) {
            console.log("get request POST failed.", error);
            reject(error);
          });
        break;
      default:
        break;
    }
  });
}

 