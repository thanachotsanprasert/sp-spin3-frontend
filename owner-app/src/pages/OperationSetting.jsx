import BookingConfigCard from '../components/dashboard/BookingConfigCard'

export default function OperationSetting() {
  return (
    <div className="min-h-screen bg-[#EEEEEE] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#000000] mb-6">
          ตั้งค่าระบบ
        </h1>
        <div className="space-y-4">
          <BookingConfigCard />
        </div>
      </div>
    </div>
  )
}
