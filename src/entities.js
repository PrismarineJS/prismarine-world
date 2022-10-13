const Vec3 = require('vec3')
const entityStatusEvents = {
  2: 'entityHurt',
  3: 'entityDead',
  6: 'entityTaming',
  7: 'entityTamed',
  8: 'entityShakingOffWater',
  10: 'entityEatingGrass'
}

module.exports = inject

function inject (world) {
  const { objects, entitiesArray } = world.registry
  const Entity = require('prismarine-entity')(world.registry)
  function setEntityData (entity, type, entityData) {
    if (entityData === undefined) {
      entityData = entitiesArray.find(entity => entity.internalId === type)
    }
    if (entityData) {
      entity.mobType = entityData.displayName
      entity.objectType = entityData.displayName
      entity.displayName = entityData.displayName
      entity.entityType = entityData.id
      entity.name = entityData.name
      entity.kind = entityData.category
      entity.height = entityData.height
      entity.width = entityData.width
    } else {
      // unknown entity
      entity.type = 'other'
      entity.entityType = type
      entity.mobType = 'unknown'
      entity.displayName = 'unknown'
      entity.name = 'unknown'
      entity.kind = 'unknown'
    }
  }
  class EntityState {
    constructor () {
      this._entities = {}
    }

    entityEquipItem (entityId, slot, item) {
      const entity = this.fetchEntity(entityId)
      entity.setEquipment(slot, item)
      this.emit('entityEquip', entity)
    }

    spawnEntity (entityId, type, objectUUID, objectData, position, angle, { headPitch }) {
      const entity = this.fetchEntity(entityId)
      const entityData = objects[type]

      entity.type = 'object'
      setEntityData(entity, type, entityData)
      this._setEntityPosition(entity, { position, angle })
      if (headPitch !== undefined) {
        entity.headPitch = headPitch
      }
      entity.uuid = objectUUID
      entity.objectData = objectData
      this.emit('entitySpawn', entity)
    }

    moveEntity (entityId, { position, angle }) {
      const entity = this.fetchEntity(entityId)
      this._setEntityPosition(entity, { position, angle })
      this.emit('entityMoved', entity)
    }

    setEntityVelocity (entityId, velocityX, velocityY, velocityZ) {
      const entity = this.fetchEntity(entityId)
      const vel = new Vec3(velocityX, velocityY, velocityZ)
      entity.velocity.update(vel)
    }

    destroyEntities (entityIds) {
      entityIds.forEach((id) => {
        const entity = this.fetchEntity(id)
        this.emit('entityGone', entity)
        entity.isValid = false
        if (entity.username && this.players[entity.username]) {
          this.players[entity.username].entity = null
        }
        delete this._entities[id]
      })
    }

    rotateEntityHead (entityId, headYaw) {
      const entity = this.fetchEntity(entityId)
      entity.headYaw = headYaw
      this.emit('entityMoved', entity)
    }

    setEntityStatus (entityId, entityStatus) {
      const entity = this.fetchEntity(entityId)
      const eventName = entityStatusEvents[entityStatus]
      if (eventName) this.emit(eventName, entity)
    }

    attachEntity (entityId, vehicleId) {
      const entity = this.fetchEntity(entityId)
      if (vehicleId === -1) {
        const vehicle = entity.vehicle
        delete entity.vehicle
        this.emit('entityDetach', entity, vehicle)
      } else {
        entity.vehicle = this.fetchEntity(vehicleId)
        this.emit('entityAttach', entity, entity.vehicle)
      }
    }

    processEntityMetadata (entityId, metadata) {
      const entity = this.fetchEntity(entityId)
      entity.metadata = parseMetadata(metadata, entity.metadata)
      this.emit('entityUpdate', entity)

      const typeSlot = this.registry.supportFeature('itemsAreAlsoBlocks') ? 5 : 6
      const slot = metadata.find(e => e.type === typeSlot)
      if (entity.name && (entity.name.toLowerCase() === 'item' || entity.name === 'item_stack') && slot) {
        this.emit('itemDrop', entity)
      }

      const pose = metadata.find(e => e.type === 18)
      if (pose && pose.value === 2) {
        this.emit('entitySleep', entity)
      }

      const bitField = metadata.find(p => p.key === 0)
      if (bitField === undefined) {
        return
      }
      if ((bitField.value & 2) !== 0) {
        entity.crouching = true
        this.emit('entityCrouch', entity)
      } else if (entity.crouching) { // prevent the initial entity_metadata packet from firing off an uncrouch event
        entity.crouching = false
        this.emit('entityUncrouch', entity)
      }
    }

    fetchEntity (id) {
      return this._entities[id] || (this._entities[id] = new Entity(id))
    }

    _setEntityPosition (entity, { pos, angle }) {
      if (pos !== undefined) {
        entity.position.set(pos.x, pos.y, pos.z)
      }
      if (angle !== undefined) {
        entity.yaw = angle.yaw
        entity.pitch = angle.pitch
      }
    }
  }
  world.entities = new EntityState()
}
function parseMetadata (metadata, entityMetadata = {}) {
  if (metadata !== undefined) {
    for (const { key, value } of metadata) {
      entityMetadata[key] = value
    }
  }

  return entityMetadata
}
