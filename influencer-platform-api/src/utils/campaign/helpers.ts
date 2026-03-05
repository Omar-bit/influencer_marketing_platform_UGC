export function validateCampaignData(campaignData: any) {
  // Model validation
  if (!campaignData.model) {
    return 'Campaign model is required';
  }

  // Name validation
  if (!campaignData.name || campaignData.name.trim() === '') {
    return 'Campaign name is required';
  }

  // Description validation
  if (!campaignData.description || campaignData.description.trim() === '') {
    return 'Campaign description is required';
  }

  // E-commerce category validation
  if (!campaignData.ecommerceCategory) {
    return 'E-commerce category is required';
  }

  // Country validation
  if (!campaignData.country || campaignData.country.trim() === '') {
    return 'Country is required';
  }

  // Budget validation
  if (
    !campaignData.budget ||
    isNaN(campaignData.budget) ||
    Number(campaignData.budget) <= 0
  ) {
    return 'Budget must be a positive number';
  }

  // Product validation
  if (!campaignData.product) {
    return 'Product selection is required';
  }

  // Status validation
  const validStatuses = ['draft', 'review', 'pending', 'closed'];
  if (!campaignData.status || !validStatuses.includes(campaignData.status)) {
    return `Status must be one of: ${validStatuses.join(', ')}`;
  }

  // Date validation for sponsored campaigns
  console.log(
    'sponsored status:',
    campaignData.isSponsored,
    typeof campaignData.isSponsored
  );

  if (
    campaignData.isSponsored === true ||
    campaignData.isSponsored === 'true'
  ) {
    if (!campaignData.startDate || !campaignData.endDate) {
      return 'Both start date and end date are required for sponsored campaigns';
    }

    const startDate = new Date(campaignData.startDate);
    const endDate = new Date(campaignData.endDate);

    if (startDate > endDate) {
      return 'Start date must be before or equal to end date';
    }

    // Optional: Check if dates are in the future
    const now = new Date();
    if (startDate < now) {
      return 'Start date must be in the future';
    }
  }

  // Platforms validation
  if (!campaignData.platforms || campaignData.platforms.length === 0) {
    return 'At least one platform must be selected';
  }

  // Number of influencers validation
  if (
    campaignData.nbrOfInfluencers &&
    Number(campaignData.nbrOfInfluencers) < 0
  ) {
    return 'Number of influencers must be a non-negative number';
  }

  return null;
}

export function validateDraftCampaignData(campaignData: any) {
  // Name validation
  if (!campaignData.name || campaignData.name.trim() === '') {
    return 'Campaign name is required';
  }

  // Description validation
  if (!campaignData.description || campaignData.description.trim() === '') {
    return 'Campaign description is required';
  }

  // Budget validation
  if (
    campaignData.budget &&
    (isNaN(campaignData.budget) || Number(campaignData.budget) <= 0)
  ) {
    return 'Budget must be a positive number';
  }

  // Product validation (optional for drafts)
  if (campaignData.productId && !campaignData.product) {
    return 'Invalid product selection';
  }

  return null;
}

export function validateCampaignStatus(status: string) {
  const validStatuses = ['draft', 'review', 'pending', 'closed'];
  if (!validStatuses.includes(status)) {
    return `Status must be one of: ${validStatuses.join(', ')}`;
  }
  return null;
}
