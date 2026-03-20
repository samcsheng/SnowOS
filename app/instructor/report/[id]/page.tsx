'use client'

import { use, useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/app/lib/store/use-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate } from '@/app/lib/utils/date-helpers'
import {
  WEATHER_OPTIONS, SNOW_CONDITIONS, TERRAIN_OPTIONS,
  SKILL_OPTIONS_SKI, SKILL_OPTIONS_SNOWBOARD, LEVEL_LABELS
} from '@/app/lib/utils/report-helpers'
import { ArrowLeft, Save, Send, Cloud, Snowflake } from 'lucide-react'
import { toast } from 'sonner'
import type { LessonReport, LessonReportEntry } from '@/app/lib/types'

interface GuestEntry {
  guest_id: string
  recommended_level: number
  progress_notes: string
}

interface DraftData {
  summary: string
  terrain_skied: string[]
  skills_worked_on: string[]
  guestEntries: GuestEntry[]
}

const DRAFT_PREFIX = 'snowos:report-draft:'

export default function LessonReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { state, getGuestsForLesson, getTemplateForLesson, getReportForLesson, submitReport } = useData()

  const lesson = useMemo(() => state.lessons.find(l => l.id === id), [state.lessons, id])
  const template = useMemo(() => lesson ? getTemplateForLesson(lesson.id) : undefined, [lesson, getTemplateForLesson])
  const guests = useMemo(() => lesson ? getGuestsForLesson(lesson.id) : [], [lesson, getGuestsForLesson])
  const existingReport = useMemo(() => lesson ? getReportForLesson(lesson.id) : null, [lesson, getReportForLesson])
  const isReadOnly = lesson?.status === 'reported' && existingReport !== null

  const instructor = useMemo(() => {
    return state.instructors.find(i => i.user_id === state.currentUserId)
  }, [state.instructors, state.currentUserId])

  const skillOptions = template?.discipline_id === '2' ? SKILL_OPTIONS_SNOWBOARD : SKILL_OPTIONS_SKI

  // Form state
  const [summary, setSummary] = useState('')
  const [terrainSkied, setTerrainSkied] = useState<string[]>([])
  const [skillsWorkedOn, setSkillsWorkedOn] = useState<string[]>([])
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([])
  const [draftSaved, setDraftSaved] = useState(false)

  // Initialize form from existing report or draft
  useEffect(() => {
    if (existingReport) {
      setSummary(existingReport.report.summary || '')
      setTerrainSkied(existingReport.report.terrain_skied || [])
      setSkillsWorkedOn(existingReport.report.skills_worked_on || [])
      setGuestEntries(existingReport.entries.map(e => ({
        guest_id: e.guest_id,
        recommended_level: e.recommended_level,
        progress_notes: e.progress_notes,
      })))
      return
    }

    // Try loading draft
    const draftKey = DRAFT_PREFIX + id
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      try {
        const data: DraftData = JSON.parse(draft)
        setSummary(data.summary)
        setTerrainSkied(data.terrain_skied)
        setSkillsWorkedOn(data.skills_worked_on)
        setGuestEntries(data.guestEntries)
        return
      } catch { /* ignore */ }
    }

    // Default entries for each guest
    setGuestEntries(guests.map(g => ({
      guest_id: g.id,
      recommended_level: template?.level_numeric || 1,
      progress_notes: '',
    })))
  }, [existingReport, id, guests, template])

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (isReadOnly) return
    const draft: DraftData = { summary, terrain_skied: terrainSkied, skills_worked_on: skillsWorkedOn, guestEntries }
    localStorage.setItem(DRAFT_PREFIX + id, JSON.stringify(draft))
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }, [id, summary, terrainSkied, skillsWorkedOn, guestEntries, isReadOnly])

  useEffect(() => {
    if (isReadOnly) return
    const timer = setTimeout(saveDraft, 2000)
    return () => clearTimeout(timer)
  }, [summary, terrainSkied, skillsWorkedOn, guestEntries, saveDraft, isReadOnly])

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    if (arr.includes(item)) setter(arr.filter(x => x !== item))
    else setter([...arr, item])
  }

  function updateGuestEntry(guestId: string, field: keyof GuestEntry, value: string | number) {
    setGuestEntries(prev => prev.map(e =>
      e.guest_id === guestId ? { ...e, [field]: value } : e
    ))
  }

  function handleSubmit() {
    if (!instructor || !lesson) return

    const report: LessonReport = {
      id: crypto.randomUUID(),
      lesson_id: lesson.id,
      submitted_by: instructor.id,
      summary: summary || null,
      terrain_skied: terrainSkied,
      skills_worked_on: skillsWorkedOn,
      created_at: new Date().toISOString(),
    }

    const entries: LessonReportEntry[] = guestEntries.map(ge => ({
      id: crypto.randomUUID(),
      report_id: report.id,
      guest_id: ge.guest_id,
      recommended_level: ge.recommended_level,
      progress_notes: ge.progress_notes,
      created_at: new Date().toISOString(),
    }))

    submitReport(report, entries)
    localStorage.removeItem(DRAFT_PREFIX + id)
    toast.success('Report submitted!')
    router.push('/instructor')
  }

  if (!lesson || !template) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {isReadOnly ? 'Lesson Report' : 'Write Report'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {template.name} &middot; {formatDate(lesson.start_time)}
          </p>
        </div>
        {draftSaved && (
          <Badge variant="outline" className="text-xs">
            <Save className="h-3 w-3 mr-1" /> Draft saved
          </Badge>
        )}
      </div>

      {/* Shared Fields */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">General Notes</label>
            <Textarea
              placeholder="How was the session overall?"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              readOnly={isReadOnly}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Snowflake className="h-3.5 w-3.5" /> Terrain Skied
            </label>
            <div className="flex flex-wrap gap-2">
              {TERRAIN_OPTIONS.map(terrain => (
                <Badge
                  key={terrain}
                  variant={terrainSkied.includes(terrain) ? 'default' : 'outline'}
                  className={`cursor-pointer ${isReadOnly ? 'pointer-events-none' : ''}`}
                  onClick={() => !isReadOnly && toggleItem(terrainSkied, terrain, setTerrainSkied)}
                >
                  {terrain}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Cloud className="h-3.5 w-3.5" /> Skills Worked On
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <Badge
                  key={skill}
                  variant={skillsWorkedOn.includes(skill) ? 'default' : 'outline'}
                  className={`cursor-pointer ${isReadOnly ? 'pointer-events-none' : ''}`}
                  onClick={() => !isReadOnly && toggleItem(skillsWorkedOn, skill, setSkillsWorkedOn)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Per-Guest Entries */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Guest Reports ({guests.length})
      </h2>

      <div className="space-y-3 mb-6">
        {guests.map(guest => {
          const entry = guestEntries.find(e => e.guest_id === guest.id)
          if (!entry) return null

          return (
            <Card key={guest.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                    {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm">{guest.first_name} {guest.last_name}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Recommended Level</label>
                    <Select
                      value={String(entry.recommended_level)}
                      onValueChange={(val) => val && updateGuestEntry(guest.id, 'recommended_level', parseInt(val))}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVEL_LABELS).map(([level, label]) => (
                          <SelectItem key={level} value={level}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Progress Notes</label>
                    <Textarea
                      placeholder={`Notes for ${guest.first_name}...`}
                      value={entry.progress_notes}
                      onChange={e => updateGuestEntry(guest.id, 'progress_notes', e.target.value)}
                      readOnly={isReadOnly}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit */}
      {!isReadOnly && (
        <div className="sticky bottom-4">
          <Button className="w-full" size="lg" onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" /> Submit Report
          </Button>
        </div>
      )}
    </div>
  )
}
