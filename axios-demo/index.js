const axios = require('axios');

axios.get('https://api.github.com/users/octocat')
  .then(response => {
    console.log('Name:', response.data.name);
    console.log('Bio:', response.data.bio);
  })
  .catch(error => {
    console.error('Error fetching data:', error.message);
  });
