import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import FindDoctors from './components/FindDoctors';
import InquiryDetail from './components/InquiryDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Profile/:id" element={<Profile/>}/>
        <Route path="/find-doctor" element={<FindDoctors/>}/>
        <Route path="/inquiry/:id" element={<InquiryDetail/>}/>


      </Routes>
    </BrowserRouter>
  );
}

export default App;