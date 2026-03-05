function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-xl px-3 py-2 text-sm text-[#F5A7A7] font-bold influencer-primary-gradient-opacity'>
      {children}
    </div>
  );
}

export default Badge;
