// Mock service for scraping RGUKT notices
// In a real implementation, this would use a backend API to scrape the website

export const scrapeRGUKTNotices = async () => {
  // Simulated scraped notices from rgukt.ac.in
  return [
    {
      id: 'rgukt-1',
      title: 'Mid-Semester Examination Schedule - All Programs',
      content: 'The mid-semester examination schedule for all undergraduate and postgraduate programs has been released. Students are advised to check their individual timetables on the student portal. Examinations will commence from March 25, 2024.',
      author: 'Academic Office - RGUKT',
      date: new Date().toISOString().split('T')[0],
      priority: 'high',
      category: 'academic',
      source: 'rgukt.ac.in',
      isScraped: true
    },
    {
      id: 'rgukt-2',
      title: 'Library Extended Hours During Examination Period',
      content: 'The central library will remain open for extended hours during the examination period. New timings: 6:00 AM to 12:00 AM. Students must carry their ID cards for entry after 10:00 PM.',
      author: 'Library Administration - RGUKT',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      priority: 'medium',
      category: 'facility',
      source: 'rgukt.ac.in',
      isScraped: true
    },
    {
      id: 'rgukt-3',
      title: 'Campus Wi-Fi Maintenance Schedule',
      content: 'Campus-wide Wi-Fi maintenance will be conducted on March 18, 2024, from 2:00 AM to 6:00 AM. Internet services will be temporarily unavailable during this period. Students are advised to plan accordingly.',
      author: 'IT Services - RGUKT',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      priority: 'low',
      category: 'technical',
      source: 'rgukt.ac.in',
      isScraped: true
    }
  ];
};

export const getLatestNotices = async () => {
  try {
    const scrapedNotices = await scrapeRGUKTNotices();
    return scrapedNotices;
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
};