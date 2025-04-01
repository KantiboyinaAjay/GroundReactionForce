import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private http: HttpClient) {}
  async googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const idToken = await result.user.getIdToken();
      console.log('Google User:', result.user);
      console.log('ID Token:', idToken);

      this.http.post('http://127.0.0.1:5000/auth/google', { idToken }).subscribe(
        (res) => console.log('Backend Response:', res),
        (err) => console.error('Error:', err)
      );
    }
    catch{}
  }

  async githubLogin() {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const idToken = await result.user.getIdToken();

      this.http.post('http://127.0.0.1:5000/auth/github', { idToken }).subscribe(
        (res) => console.log('Backend Response:', res),
        (err) => console.error('Error:', err)
      );
    }
    catch{}
  }

  logout() {
    return signOut(this.auth);
  }
}