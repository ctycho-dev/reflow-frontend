'use client'

import { useState } from 'react'
import { Token } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateCampaignModalProps {
  onSubmit: (data: {
    name: string
    token: Token
    threshold: number
    startDate: string
    endDate: string
    rewardPoints: number
  }) => void
}

export function CreateCampaignModal({ onSubmit }: CreateCampaignModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [token, setToken] = useState<Token>('USDC')
  const [threshold, setThreshold] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rewardPoints, setRewardPoints] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      token,
      threshold: parseFloat(threshold),
      startDate,
      endDate,
      rewardPoints: parseInt(rewardPoints),
    })
    setOpen(false)
    // Reset form
    setName('')
    setToken('USDC')
    setThreshold('')
    setStartDate('')
    setEndDate('')
    setRewardPoints('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 mr-2"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., USDC Power Users"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={token} onValueChange={(v) => setToken(v as Token)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="weETH">weETH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">
              Threshold ({token === 'USDC' ? '$' : 'ETH'})
            </Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={token === 'USDC' ? '500' : '0.5'}
              required
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewardPoints">Reward Points</Label>
            <Input
              id="rewardPoints"
              type="number"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(e.target.value)}
              placeholder="100"
              required
              className="font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
