import { ActionBar } from "./components/ActionBar/ActionBar";
import { Header } from "./components/Header";
import { Splits } from "./components/Splits/Splits";
import "./styles.scss";
import { SplitDataProvider } from "./store/split-data-context";

function App() {
  return (
    <div className="app">
      <Header />
      <div className="body">
        <SplitDataProvider>
          <ActionBar />
          <Splits />
        </SplitDataProvider>
      </div>
    </div>
  );
}

export default App;
