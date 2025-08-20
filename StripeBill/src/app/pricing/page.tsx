'use client'

import { ArrowRightIcon, CheckIcon, BoltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <BoltIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StripeBill RO</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                Acasă
              </Link>
              <Link href="/#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Funcționalități
              </Link>
              <Link href="/pricing" className="text-primary-600 font-medium">
                Prețuri
              </Link>
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
            Prețuri simple și 
            <span className="text-primary-600"> transparente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Începe gratuit cu 3 facturi, apoi alege planul care se potrivește afacerii tale.
            Fără costuri ascunse, fără comisioane pe factură.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-5xl font-bold text-gray-900 mb-4">
                  0€<span className="text-xl font-normal text-gray-600">/lună</span>
                </div>
                <p className="text-gray-600">Perfect pentru a testa platforma</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">3 facturi gratuite</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Conectare Stripe (OAuth securizat)</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Integrare SmartBill sau FGO</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Dashboard de bază</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Support email</span>
                </div>
              </div>

              <Link 
                href="/auth/register"
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors block text-center font-medium"
              >
                Începe gratuit
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                  🔥 Cel mai popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-5xl font-bold mb-4">
                  29€<span className="text-xl font-normal text-primary-100">/lună</span>
                </div>
                <p className="text-primary-100">Pentru afaceri în creștere</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Facturi nelimitate</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Email automat către clienți</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Dashboard complet cu analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Backup automat PDF în cloud</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Webhook-uri personalizate</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Suport prioritar (chat & email)</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white">Integrări multiple (SmartBill + FGO)</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/stripe/create-subscription', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'pro' })
                    })
                    
                    if (response.ok) {
                      const { url } = await response.json()
                      if (url) window.location.href = url
                    } else if (response.status === 401) {
                      // User not authenticated, redirect to register
                      window.location.href = '/auth/register'
                    } else {
                      alert('A apărut o eroare. Încearcă să te autentifici mai întâi.')
                    }
                  } catch (error) {
                    console.error('Subscription error:', error)
                    window.location.href = '/auth/register'
                  }
                }}
                className="w-full bg-white text-primary-600 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors font-bold flex items-center justify-center"
              >
                Upgrade la Pro
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Întrebări frecvente
            </h2>
            <p className="text-xl text-gray-600">
              Răspunsuri la cele mai comune întrebări despre prețuri și funcționalități
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Ce se întâmplă după cele 3 facturi gratuite?
              </h3>
              <p className="text-gray-600">
                După ce folosești cele 3 facturi gratuite, vei fi redirecționat către pagina de upgrade pentru a alege planul Pro. 
                Până nu faci upgrade, nu vor mai fi generate facturi noi, dar vei putea accesa facturile existente.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Există comisioane pe fiecare factură generată?
              </h3>
              <p className="text-gray-600">
                Nu! Plătești doar abonamentul lunar fix de 29€ pentru planul Pro. Nu există comisioane pe factură, 
                indiferent de câte facturi generezi sau de valoarea acestora.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Pot schimba planul oricând?
              </h3>
              <p className="text-gray-600">
                Da, poți face upgrade de la Free la Pro oricând. Dacă ai planul Pro, poți face downgrade la Free, 
                dar vei fi limitat din nou la funcționalitățile de bază.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Ce furnizori de facturi sunt suportați?
              </h3>
              <p className="text-gray-600">
                Momentan suportăm SmartBill și FGO, care sunt cei mai populari furnizori de facturi din România. 
                În planul Pro poți configura ambele integrări simultan.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Sunt facturile conforme cu legislația română?
              </h3>
              <p className="text-gray-600">
                Da! Toate facturile generate prin SmartBill sau FGO sunt 100% conforme cu legislația română, 
                incluzând TVA, numerotarea secvențială și toate informațiile legale necesare.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Cum funcționează perioada de probă?
              </h3>
              <p className="text-gray-600">
                Perioada de probă constă în cele 3 facturi gratuite din planul Free. Nu avem o perioadă de probă cu timp limitat, 
                ci cu număr limitat de facturi, astfel încât să poți testa platforma în ritmul tău.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Gata să automatizezi facturarea?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Începe cu 3 facturi gratuite și vezi cât timp poți economisi
          </p>
          <Link 
            href="/auth/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Începe gratuit acum
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-primary-200 text-sm mt-4">
            Fără card de credit necesar • Configurare în 5 minute
          </p>
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