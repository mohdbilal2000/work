import React from 'react'
import './MainContent.css'
import DashboardPage from './pages/DashboardPage'
import ESICPFCompliancePage from './pages/ESICPFCompliancePage'
import VendorManagementPage from './pages/VendorManagementPage'
import InteriorPayrollPage from './pages/InteriorPayrollPage'
import OfficeUtilitiesPage from './pages/OfficeUtilitiesPage'
import TicketManagementPage from './pages/TicketManagementPage'

function MainContent({ activePage }) {
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />
      case 'Vendor Management':
        return <VendorManagementPage />
      case 'Internal Payroll':
        return <InteriorPayrollPage />
      case 'ESIC/PF Compliance':
        return <ESICPFCompliancePage />
      case 'Office Utilities':
        return <OfficeUtilitiesPage />
      case 'Ticket Management':
        return <TicketManagementPage />
      default:
        return <DashboardPage />
    }
  }

  return <div className="main-content">{renderPage()}</div>
}

export default MainContent

