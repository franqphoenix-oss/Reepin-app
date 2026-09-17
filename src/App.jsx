import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";

import OrderDetails from "./pages/OrderDetails";
import FollowUps from "./pages/FollowUps";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

import AppShell from "./components/layout/AppShell";

import { OrderProvider } from "./context/OrderContext";
import { AppProvider } from "./context/AppContext";

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <OrderProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />

            <Route path="/login" element={<Login />} />

            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/orders" element={<Orders />} />

              <Route path="/orders/new" element={<NewOrder />} />

              <Route path="/orders/:orderId" element={<OrderDetails />} />

              <Route path="/follow-ups" element={<FollowUps />} />

              <Route path="/customers" element={<Customers />} />

              <Route path="/settings" element={<Settings />} />

              <Route path="/orders/:orderId/edit" element={<NewOrder />} />
            </Route>
          </Routes>
        </OrderProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
