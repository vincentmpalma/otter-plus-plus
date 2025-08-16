import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from '../utils/supabase'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() =>{
    // load session

    // sees if there is a session, returns a promise then
    // we use then to handle the promise and we data as a res data
    // then we set the user to its session user or null if not
    supabase.auth.getSession().then(({data}) => {
      setUser(data.session?.user ?? null)
    });

    // listen for changes and store data variable returned in variable called sub
    // using supabase auth api to use onAuthStateChange event listener
    // this will be triggered everytime a sign in or sing out occurs
    // when an event happens supabase will send the type of even (either sign in/out as the _event)
    // and current session object after the change
    // then set the new session to the user
    // and give subscriptio data of session to sub so we can unsub later to the event listener
    const {data:sub} = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // will run when component is unmounted and we unsub from the even listner ^
    return () => sub.subscription.unsubscribe();
  }, []);


    // calls supbase login with google
    // it redirect user to google login pop up
    const signInWithGoogle = () => {
    supabase.auth.signInWithOAuth({ provider: "google" });
  };

  // tells supabase to sign out
    const signOut = () => {
    supabase.auth.signOut();
  };

  async function fetchMe() {
    const { data } = await supabase.auth.getSession(); // supabase storing session object in local storage
    const token = data.session?.access_token; // getting token
    if (!token) return alert("No session token"); // if token does not exist return

    // use backend api to get user info and send token for middleware
    const res = await fetch("http://localhost:4000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // person object
    const me = await res.json();
    console.log("me:", me);
    alert(`Backend says you are: ${me.email || JSON.stringify(me)}`);
  }

  return (
    <div style={{ padding: 24 }}>
          {user ? (
      <>
        <div>Welcome, <b>{user.email}</b></div>
        <button onClick={signOut}>Sign out</button>
        <button onClick={fetchMe}>Test /api/me</button>
      </>
    ) : (
      <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <br></br>
      <text>Test</text>
      </>
    )}
    </div>
  );
}
