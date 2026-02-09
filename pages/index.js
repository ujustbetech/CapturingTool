import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';


const HomePage = () => {
  

  return (
    <>
  
    <div className='mainContainer'>
    <div className='logosContainer'>
      {/* <img src="/ujustlogo.png" alt="Logo" className="logo" /> */}
    </div>
    <div style={{ padding: '20px' }}>
      <h1>Welcome to the Event Management System</h1> 
    </div>
    </div>
    </>
  );
};



export default HomePage;
