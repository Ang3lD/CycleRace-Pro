export class DashboardController {
  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository;
  }

  getStats = async (req, res) => {
    try {
      const stats = await this.dashboardRepository.getStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
