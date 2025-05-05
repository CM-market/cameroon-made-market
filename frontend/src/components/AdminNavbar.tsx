
import React from "react";
import { Link } from "react-router-dom";
import { User, LayoutDashboard, Package, ShoppingCart, UserCheck, CheckSquare, Settings } from "lucide-react";
import { Button } from "./ui/button";

const AdminNavbar: React.FC = () => {
  return (
    <nav className="bg-cm-green text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="font-bold text-xl flex items-center">
            <img
              src="/placeholder.svg"
              alt="Made in Cameroon"
              className="h-8 w-8 mr-2"
            />
            <span>Made in Cameroon <span className="text-sm font-normal">Admin</span></span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/dashboard">
              <LayoutDashboard size={18} className="mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/products">
              <Package size={18} className="mr-2" />
              Products
            </Link>
          </Button>
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/orders">
              <ShoppingCart size={18} className="mr-2" />
              Orders
            </Link>
          </Button>
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/producers">
              <UserCheck size={18} className="mr-2" />
              Producers
            </Link>
          </Button>
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/approvals">
              <CheckSquare size={18} className="mr-2" />
              Approvals
            </Link>
          </Button>
          <Button variant="ghost" className="text-white hover:text-cm-yellow" asChild>
            <Link to="/admin/settings">
              <Settings size={18} className="mr-2" />
              Settings
            </Link>
          </Button>
          <Button className="bg-white text-cm-green hover:bg-cm-sand" asChild>
            <Link to="/admin/account">
              <User size={18} className="mr-2" />
              Account
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
