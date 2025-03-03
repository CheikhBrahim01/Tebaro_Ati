const Hero = ({
    title = 'Tebaro_ati',
    subtitle = "Votre générosité a la pouvoir de transformer une vie dés aujourd'hui",
  }) => {
    return (
      <section className='bg-indigo-50 py-19 mb-2'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold text-black sm:text-5xl md:text-6xl'>
              {title}
            </h1>
            <p className='my-4 text-xl text-black'>{subtitle}</p>
          </div>
        </div>
      </section>
    );
  };
  export default Hero;
  