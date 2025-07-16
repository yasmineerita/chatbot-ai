import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import './App.css';
import Header from "./components/Header";
import ChatbotPage from "./components/ChatbotPage";


function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route
          path="/"
          element={<ChatbotPage/>}
        />
      </Routes>
    </Router>
  );
}

export default App;
