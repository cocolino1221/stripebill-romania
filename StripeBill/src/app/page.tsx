import { ArrowRightIcon, CheckIcon, BoltIcon, CogIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BoltIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StripeBill RO</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Funcționalități
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
                Cum funcționează
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
                Prețuri
              </a>
            </nav>
            <div className="flex space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Autentificare
              </Link>
              <Link 
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Începe gratuit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transformă plățile Stripe în 
            <span className="text-primary-600"> facturi românești</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Conectează contul Stripe și generează automat facturi conforme cu legislația română 
            în SmartBill sau FGO. Primele 3 facturi sunt gratuite!
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/register"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              Începe gratuit
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg hover:bg-gray-50 transition-colors">
              Urmărește demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              De ce să alegi StripeBill RO?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automatizează procesul de facturare și economisește ore de lucru manual
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <BoltIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automat</h3>
              <p className="text-gray-600">
                Facturile se generează automat la fiecare plată Stripe, fără intervenția ta
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <DocumentTextIcon className="h-12 w-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Conform</h3>
              <p className="text-gray-600">
                Facturi conforme cu legislația română, integrate cu SmartBill sau FGO
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CogIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplu</h3>
              <p className="text-gray-600">
                Configurare în 5 minute. Conectezi Stripe și furnizorul de facturi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cum funcționează?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conectează Stripe</h3>
              <p className="text-gray-600">OAuth securizat către contul tău Stripe</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Alege furnizorul</h3>
              <p className="text-gray-600">SmartBill sau FGO + configurarea seriei de facturi</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Activează webhook</h3>
              <p className="text-gray-600">Configurăm automat webhook-ul în Stripe</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-success-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Facturi automate</h3>
              <p className="text-gray-600">La fiecare plată → factură generată automat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prețuri simple și transparente
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                0€<span className="text-lg font-normal text-gray-600">/lună</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>3 facturi gratuite</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>Conectare Stripe</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>SmartBill sau FGO</span>
                </li>
              </ul>
              <Link 
                href="/auth/register"
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors block text-center"
              >
                Începe gratuit
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="border-2 border-primary-600 rounded-lg p-8 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm">
                Recomandat
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">
                29€<span className="text-lg font-normal text-gray-600">/lună</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>Facturi nelimitate</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>Email automat către clienți</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>Dashboard complet</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span>Suport prioritar</span>
                </li>
              </ul>
              <Link 
                href="/auth/register"
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors block text-center"
              >
                Upgrade la Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BoltIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold">StripeBill RO</span>
            </div>
            <p className="text-gray-400">
              © 2024 StripeBill RO. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}