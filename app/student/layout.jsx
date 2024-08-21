import Navbar from "../ui/dashboard/navbar/navbar";
import Sidebar from "../ui/dashboard/sidebar/sidebar";
import styles from "../ui/dashboard/dashboard.module.css"
import Footer from "../ui/dashboard/footer/footer";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHouse, faList, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import AuthProvider from "../context/AuthProvider";
import Chart from '../ui/dashboard/chart/chart.jsx'
import { options } from "@/app/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

const Layout = async ({ children }) => {
    const session = await getServerSession(options)

    if (!session) {
        redirect('/api/auth/signin?callbackUrl=/student')
    }

    const user = session.user;
    return (
        <AuthProvider>
            <div className={styles.container}>
                <div className={styles.menu}>
                    <Sidebar menuItems={menuItemsStudent} Name={user.name} Role="Student" />
                </div>
                <div className={styles.content}>
                    <Navbar />
                    {children}
                    <Footer />
                </div>
            </div>
        </AuthProvider>
    );
};

export default Layout;

const menuItemsStudent = [
    {
        list: [
            {
                title: "Dashboard",
                path: "/student",
                icon: <FontAwesomeIcon icon={faHouse} className="fas fa-house" style={{ color: "grey" }}
                />
            },
            {
                title: "Results",
                path: "/student/result/test",
                icon: <FontAwesomeIcon icon={faUser} className="fas fa-user" style={{ color: "grey" }}
                />
            },
            {
                title: "Details",
                path: "/student",
                icon: <FontAwesomeIcon icon={faList} className="fas fa-list" style={{ color: "grey" }}
                />
            }
        ]
    }
]


