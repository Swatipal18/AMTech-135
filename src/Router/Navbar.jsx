import React from 'react'
import Login from '../Login'
import Sidebar from '../Component/Layout/Sidebar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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

                // Staff Management Routes
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

                // // Other Management Routes
                // {
                //     path: "/franchise",
                //     element: <FranchiseManagement />
                // },
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
                // {
                //     path: "/users",
                //     element: <UserManagement />
                // },
                // {
                //     path: "/sales",
                //     element: <SalesManagement />
                // },
                // {
                //     path: "/reports",
                //     element: <ReportsAnalytics />
                // },
                {
                    path: "/AllNotifications",
                    element: <AllNotifications />
                },
                {
                    path: "/NewNotification",
                    element: <NewNotification />
                },
                // {
                //     path: "/banners",
                //     element: <UploadBanners />
                // },
                // {
                //     path: "/business",
                //     element: <BusinessManagement />
                // }
            ]
        }

    ])
    return <RouterProvider router={router} />
}

export default Navbar