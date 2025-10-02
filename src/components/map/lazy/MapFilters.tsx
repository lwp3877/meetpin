/* src/components/map/lazy/MapFilters.tsx */
// 🎯 지도 필터 컴포넌트: 필터 버튼 클릭시에만 로딩

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import Filter from 'lucide-react/dist/esm/icons/filter'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign'
import Users from 'lucide-react/dist/esm/icons/users'

interface MapFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  maxPeople: number[]
  setMaxPeople: (people: number[]) => void
  timeFilter: string
  setTimeFilter: (filter: string) => void
}

export default function MapFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  setPriceRange,
  maxPeople,
  setMaxPeople,
  timeFilter,
  setTimeFilter,
}: MapFiltersProps) {
  return (
    <Card className="animate-in slide-in-from-top-2 mt-6 rounded-2xl border-2 border-emerald-200/30 bg-gradient-to-br from-white/98 to-emerald-50/50 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl duration-300 dark:border-emerald-800/30 dark:from-gray-900/98 dark:to-emerald-950/50">
      <CardContent className="p-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Category Filter */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-bold text-gray-800 dark:text-gray-200">
              <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                <Filter className="h-3 w-3 text-white" aria-hidden="true" />
              </div>
              카테고리
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'all', label: '전체', emoji: '🌐', color: 'from-gray-400 to-gray-500' },
                { key: 'drink', label: '술', emoji: '🍻', color: 'from-amber-400 to-orange-500' },
                { key: 'exercise', label: '운동', emoji: '💪', color: 'from-red-400 to-pink-500' },
                {
                  key: 'other',
                  label: '기타',
                  emoji: '✨',
                  color: 'from-purple-400 to-indigo-500',
                },
              ].map(category => (
                <Button
                  key={category.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategoryChange(category.key)}
                  className={`group rounded-xl p-3 transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.key
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-emerald-500/25`
                      : 'bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <div
                      className={`text-lg ${selectedCategory === category.key ? 'animate-bounce' : 'transition-transform group-hover:scale-110'}`}
                    >
                      {category.emoji}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        selectedCategory === category.key
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.label}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              시간
            </label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700" aria-label="시간 필터">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="tomorrow">내일</SelectItem>
                <SelectItem value="week">이번 주</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
              <DollarSign className="mr-2 h-4 w-4" aria-hidden="true" />
              참가비 (최대{' '}
              {priceRange[0] === 100000 ? '10만원+' : `${priceRange[0].toLocaleString()}원`})
            </label>
            <div className="space-y-3">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                min={0}
                step={10000}
                aria-label="참가비 범위"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>무료</span>
                <span>10만원+</span>
              </div>
            </div>
          </div>

          {/* Max People */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Users className="mr-2 h-4 w-4" aria-hidden="true" />
              최대 인원 ({maxPeople[0]}명 이하)
            </label>
            <div className="space-y-3">
              <Slider
                value={maxPeople}
                onValueChange={setMaxPeople}
                max={20}
                min={2}
                step={1}
                aria-label="최대 인원"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>2명</span>
                <span>20명+</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
