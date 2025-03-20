import React from 'react'
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
    Outlet
} from 'react-router-dom'
import Login from '../Login'
import Admin from '../Component/Dashboard/Admin'
import AppLayout from '../Component/Layout/AppLayout'
import AllItem from '../Component/Item/AllItem'
import AddItem from '../Component/Item/AddItem'
import Categories from '../Component/Item/Categories'
import AllStaff from '../Component/Staff/AllStaff'
import AddStaff from '../Component/Staff/AddStaff'
import OrderManagement from '../Component/Order/OrderManagement'
import PreperingOrder from '../Component/Order/PreperingOrder'
import Outfordelivery from '../Component/Order/Outfordelivery'
import AllOrder from '../Component/Order/AllOrder'
import SubscriptionForm from '../Component/subscription/SubscriptionForm'
import EditStaff from '../Component/Staff/EditStaff'
import EditItem from '../Component/Item/EditItem'
import AllNotifications from '../Component/Notifications/AllNotifications'
import NewNotification from '../Component/Notifications/NewNotification'
import Sizes from '../Component/Item/Size/Sizes'
import HistoryManagement from '../Component/history/History-Management'
import Franchise from '../Component/franchise/Franchise'
import Users from '../Component/UsersManagement/Users'
import Sales from '../Component/SalesManagement/Sales'
import ReportsAnalytics from '../Component/ReportsAnalytics/ReportsAnalytics'
import AllBanners from '../Component/UploadBanners/AllBanners'
import BusinessManagement from '../Component/BusinessManagement/BusinessManagement'
import MenuManagement from '../Component/MenuManagement/MenuManagement'
import Support from '../Component/Support/Support'
import Settings from '../Component/Settings/Settings'
import NewBanner from '../Component/UploadBanners/NewBanner'
import NewUser from '../Component/UsersManagement/NewUser'
import EditUser from '../Component/UsersManagement/EditUser'
import AllSubscriptions from '../Component/subscription/AllSubscriptions'
import ActiveSubscription from '../Component/subscription/ActiveSubscription'
import EditSubscriptionForm from '../Component/subscription/EditSubscriptionForm'
import AddOns from '../Component/Item/AddOns'
import Ingredients from '../Component/Item/Ingredients'
import EditBanners from '../Component/UploadBanners/EditBanners'
import EditNotification from '../Component/Notifications/EditNotification'

// Protected Route Component
const ProtectedRoute = () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

function Navbar() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Login />
        },
        {
            path: "/",
            element: <AppLayout />,
            children: [
                {
                    element: <ProtectedRoute />,
                    children: [
                        {
                            path: "/admin",
                            element: <Admin />
                        },
                        {
                            path: "/all-items",
                            element: <AllItem />
                        },
                        {
                            path: "/AddNewItem",
                            element: <AddItem />
                        },
                        {
                            path: "/EditItem/:id",
                            element: <EditItem />
                        },
                        {
                            path: "/categories",
                            element: <Categories />
                        },
                        {
                            path: "/sizes",
                            element: <Sizes />
                        },
                        {
                            path: "/AddOns",
                            element: <AddOns />
                        },
                        {
                            path: "/Ingredients",
                            element: <Ingredients />
                        },
                        {
                            path: "/AllStaff",
                            element: <AllStaff />
                        },
                        {
                            path: "/AddStaff",
                            element: <AddStaff />
                        },
                        {
                            path: "/EditStaff/:id",
                            element: <EditStaff />
                        },
                        {
                            path: "/franchise",
                            element: <Franchise />
                        },
                        {
                            path: "/OrderManagement",
                            element: <OrderManagement />
                        },
                        {
                            path: "/history",
                            element: <HistoryManagement />
                        },
                        {
                            path: "/PreperingOrder",
                            element: <PreperingOrder />
                        },
                        {
                            path: "/Outfordelivery",
                            element: <Outfordelivery />
                        },
                        {
                            path: "/AllOrders",
                            element: <AllOrder />
                        },
                        {
                            path: "/Subscription",
                            element: <SubscriptionForm />
                        },
                        {
                            path: "/AllSubscriptions",
                            element: <AllSubscriptions />
                        },
                        {
                            path: "/ActiveSubscription",
                            element: <ActiveSubscription />
                        },
                        {
                            path: "/EditSubscriptionForm/:id",
                            element: <EditSubscriptionForm />
                        },
                        {
                            path: "/users",
                            element: <Users />
                        },
                        {
                            path: "/NewUser",
                            element: <NewUser />
                        },
                        {
                            path: "/EditUser/:id",
                            element: <EditUser />
                        },
                        {
                            path: "/sales",
                            element: <Sales />
                        },
                        {
                            path: "/reports",
                            element: <ReportsAnalytics />
                        },
                        {
                            path: "/AllNotifications",
                            element: <AllNotifications />
                        },
                        {
                            path: "/NewNotification",
                            element: <NewNotification />
                        },
                        {
                            path: "/EditNotification/:id",
                            element: <EditNotification />
                        },
                        {
                            path: "/AllBanners",
                            element: <AllBanners />
                        },
                        {
                            path: "/NewBanner",
                            element: <NewBanner />
                        },
                        {
                            path: "/EditBanner/:id",
                            element: <EditBanners />
                        },
                        {
                            path: "/business",
                            element: <BusinessManagement />
                        },
                        {
                            path: "/menu",
                            element: <MenuManagement />
                        },
                        {
                            path: "/support",
                            element: <Support />
                        },
                        {
                            path: "/settings",
                            element: <Settings />
                        },
                    ]
                }
            ]
        }
    ])
    return <RouterProvider router={router} />
}

export default Navbar;