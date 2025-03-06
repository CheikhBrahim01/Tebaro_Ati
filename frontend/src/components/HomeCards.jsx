import { Link } from 'react-router-dom';
import Card from './Card';

const HomeCards = () => {
  return (
    <section className='py-4'>
      <div className='container-xl lg:container m-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg'>
          <Card>
            <h2 className='text-2xl font-bold'>Pour Donateur</h2>
            <p className='mt-2 mb-4'>
              Browse all projects on Tebaro_ati and start helping
            </p>
            <Link
              to='/projects'
              className='inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700'
            >
              Browse
            </Link>
          </Card>

          <Card bg='bg-blue-50'>
            <h2 className='text-2xl font-bold'>For Beneficiary</h2>
            <p className='mt-2 mb-4'>
              List your project to find the perfect donor for help
            </p>
            <Link
              to='/add-project'
              className='inline-block bg-cyan-500 text-white rounded-lg px-4 py-2 hover:bg-cyan-500'
            >
              Add Project
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
