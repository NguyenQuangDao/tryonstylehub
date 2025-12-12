'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle2, Home, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl overflow-hidden relative">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-green-100 rounded-full opacity-50 blur-2xl"></div>
           </div>

           <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 w-full relative z-10" />
           
           <CardContent className="pt-12 pb-10 px-8 text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                Thanh toán thành công!
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 mb-8 leading-relaxed"
              >
                Cảm ơn bạn đã sử dụng dịch vụ. <br/>
                <span className="font-semibold text-gray-700">Token</span> đã được cộng vào tài khoản của bạn.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <Link href="/dashboard" className="block w-full">
                  <Button className="w-full h-12 text-base gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200">
                    <Home className="w-4 h-4" />
                    Về Dashboard
                  </Button>
                </Link>
                
                <Link href="/tokens" className="block w-full">
                  <Button variant="outline" className="w-full h-12 text-base gap-2 hover:bg-gray-50 border-gray-200">
                    <Wallet className="w-4 h-4" />
                    Mua thêm Token
                  </Button>
                </Link>
              </motion.div>
           </CardContent>
        </Card>
    
      </motion.div>
    </div>
  )
}
