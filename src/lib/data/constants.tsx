export interface ProcessStep {
    id: string;
    stepNumber: string;
    title: string;
    description: string;
    iconName: 'search' | 'fileText' | 'checkCircle' | 'truck' | 'mapPin';
  }
  
  export const processSteps: ProcessStep[] = [
    {
      id: 'step-01',
      stepNumber: 'STEP 01',
      title: 'Search & Request',
      description:
        'Browse verified US vehicles and submit a request for your car.',
      iconName: 'search',
    },
    {
      id: 'step-02',
      stepNumber: 'STEP 02',
      title: 'Quote & Deposit',
      description:
        'Receive detailed pricing and pay a 30% deposit to secure your vehicle.',
      iconName: 'fileText',
    },
    {
      id: 'step-03',
      stepNumber: 'STEP 03',
      title: 'Inspection & Approval',
      description:
        'Review professional inspection report and VIN history before purchase.',
      iconName: 'checkCircle',
    },
    {
      id: 'step-04',
      stepNumber: 'STEP 04',
      title: 'Purchase & Ship',
      description:
        'We buy the vehicle and handle export, shipping, and customs clearance.',
      iconName: 'truck',
    },
    {
      id: 'step-05',
      stepNumber: 'STEP 05',
      title: 'Delivery',
      description: 'Receive your vehicle at your doorstep anywhere in Nigeria.',
      iconName: 'mapPin',
    },
  ];
  