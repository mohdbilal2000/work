const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Fetch data with error handling
    let clients = [];
    let services = [];
    let tickets = [];

    try {
      clients = await db.getData('/clients') || [];
    } catch (err) {
      console.error('Error fetching clients:', err);
      clients = [];
    }

    try {
      services = await db.getData('/services') || [];
    } catch (err) {
      console.error('Error fetching services:', err);
      services = [];
    }

    try {
      tickets = await db.getData('/tickets') || [];
    } catch (err) {
      console.error('Error fetching tickets:', err);
      tickets = [];
    }
    
    // Ensure arrays
    if (!Array.isArray(clients)) clients = [];
    if (!Array.isArray(services)) services = [];
    if (!Array.isArray(tickets)) tickets = [];
    
    const stats = {
      totalClients: clients.length || 0,
      activeClients: clients.filter(c => c && c.status === 'active').length || 0,
      inactiveClients: clients.filter(c => c && c.status === 'inactive').length || 0,
      dormantClients: clients.filter(c => c && c.status === 'dormant').length || 0,
      totalServices: services.length || 0,
      warmServices: services.filter(s => s && s.status === 'warm').length || 0,
      pendingServices: services.filter(s => s && (s.status === 'pending' || s.status === 'warm')).length || 0,
      totalTickets: tickets.length || 0,
      openTickets: tickets.filter(t => t && t.status === 'open').length || 0,
      resolvedTickets: tickets.filter(t => t && t.status === 'resolved').length || 0,
    };

    // Recent activities
    let recentTickets = [];
    try {
      recentTickets = tickets
        .filter(t => t && t.created_at)
        .sort((a, b) => {
          try {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
          } catch (err) {
            return 0;
          }
        })
        .slice(0, 5)
        .map(ticket => {
          const service = services.find(s => s && s.id === ticket.service_id);
          const client = service ? clients.find(c => c && c.id === service.client_id) : null;
          return {
            ...ticket,
            service_type: service ? service.service_type : null,
            client_name: client ? client.name : null
          };
        });
    } catch (err) {
      console.error('Error processing recent tickets:', err);
      recentTickets = [];
    }

    // Services by status
    const servicesByStatus = {};
    try {
      (services || []).forEach(service => {
        if (service && service.status) {
          servicesByStatus[service.status] = (servicesByStatus[service.status] || 0) + 1;
        }
      });
    } catch (err) {
      console.error('Error processing services by status:', err);
    }
    const servicesByStatusArray = Object.entries(servicesByStatus).map(([status, count]) => ({ status, count }));

    // Tickets by status
    const ticketsByStatus = {};
    try {
      (tickets || []).forEach(ticket => {
        if (ticket && ticket.status) {
          ticketsByStatus[ticket.status] = (ticketsByStatus[ticket.status] || 0) + 1;
        }
      });
    } catch (err) {
      console.error('Error processing tickets by status:', err);
    }
    const ticketsByStatusArray = Object.entries(ticketsByStatus).map(([status, count]) => ({ status, count }));

    res.json({
      ...stats,
      recentTickets: recentTickets || [],
      servicesByStatus: servicesByStatusArray || [],
      ticketsByStatus: ticketsByStatusArray || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    // Return default stats instead of error
    res.json({
      totalClients: 0,
      activeClients: 0,
      inactiveClients: 0,
      dormantClients: 0,
      totalServices: 0,
      warmServices: 0,
      pendingServices: 0,
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      recentTickets: [],
      servicesByStatus: [],
      ticketsByStatus: []
    });
  }
});

module.exports = router;
