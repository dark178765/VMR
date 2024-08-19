import { Controller, Get, Render } from "@nestjs/common";

@Controller()
export class ServicesController {
    @Get(['services', 'services/consulting-services',
        'services/tailored-insights',
        'services/syndicated-market-research',
        'services/competitive-intelligence', 'services/market-monitoring', 'services/customer-research'])
    @Render('services')
    async getServices() {
        return {
            metatitle: 'Services We Offer | Vantage Market Research',
            metakeywords: 'Consulting Services, Market Monitoring, Tailored Insights, Syndicate Market Research, Competitive Intelligence',
            metadescription: 'Consulting Services, Market Monitoring, Tailored Insights, Syndicate Market Research, Competitive Intelligence | Vantage Market Research '
        };
    }
}