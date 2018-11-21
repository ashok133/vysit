// document.cookie = "test_cookie=test_val; path=/";

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var email = profile.getEmail();
  document.getElementById('profileInfo').innerHTML = "Welcome " + profile.getName();
  document.getElementById('signOutButton').style.visibility = 'visible';
  saveSession(email);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    document.getElementById('profileInfo').innerHTML = '';
    document.getElementById('signOutButton').style.visibility = 'hidden';
  })
}

function saveSession(email) {
  var expiration_date = new Date();
  var cookie_string = '';
  expiration_date.setFullYear(expiration_date.getFullYear() + 1);
  // Build the set-cookie string:
  cookie_string = "saved_session_email=" + email + "; path=/; expires=" + expiration_date.toUTCString();
  // Create or update the cookie:
  document.cookie = cookie_string;
}
