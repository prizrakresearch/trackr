import { useState } from "react"
import { Modal } from "@/components/shared/Modal"
import { AddEntityRow } from "./AddEntityRow"
import { EntityList } from "./EntityList"

export function ManageEntities({
  open,
  onClose,
  companies = [],
  feedItems = [],
  loading = false,
  error = "",
  onAdd,
  onRemove,
}) {
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [actionError, setActionError] = useState("")

  async function handleAdd(payload) {
    if (!onAdd) return

    try {
      setActionError("")
      setAdding(true)
      await onAdd(payload)
    } catch (err) {
      setActionError(err?.message ?? "Failed to add entity")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id) {
    if (!onRemove) return

    try {
      setActionError("")
      setRemovingId(id)
      await onRemove(id)
    } catch (err) {
      setActionError(err?.message ?? "Failed to remove entity")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage entities" className="max-w-2xl">
      <div className="px-5 py-4 space-y-4">
        <AddEntityRow
          onAdd={handleAdd}
          adding={adding}
          error={actionError || error}
        />

        <EntityList
          companies={companies}
          feedItems={feedItems}
          loading={loading}
          removingId={removingId}
          onRemove={handleRemove}
        />
      </div>
    </Modal>
  )
}
