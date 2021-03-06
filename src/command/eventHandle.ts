import { AudioPlayerStatus, createAudioResource } from '@discordjs/voice'
import Discord from 'discord.js'
import { soundfile } from '../config'
import { ismoConnections } from '../storage'
import { anySpeaking } from '../util'

export const handleSpeakingStart = (id: string, interaction: Discord.CommandInteraction<Discord.CacheType>) => {
    if (!interaction.guild) return

    const ismoConnection = ismoConnections.get(interaction.guild.id)

    if (!ismoConnection) return

    if (anySpeaking(ismoConnection.speakingMap) || ismoConnection.player.state.status === AudioPlayerStatus.Playing) {
        ismoConnection.speakingMap.set(id, true)
        return
    }

    const resource = createAudioResource(soundfile, { inlineVolume: true })
    resource.volume?.setVolume(3)

    ismoConnection.player.play(resource)
    ismoConnection.speakingMap.set(id, true)
}

export const handleSpeakingEnd = (id: string, interaction: Discord.CommandInteraction<Discord.CacheType>) => {
    if (!interaction.guild) return

    const ismoConnection = ismoConnections.get(interaction.guild.id)
    if (!ismoConnection) return

    ismoConnection.speakingMap.set(id, false)

    if (anySpeaking(ismoConnection.speakingMap)) return

    setTimeout(() => {
        if (!anySpeaking(ismoConnection.speakingMap)) {
            ismoConnection.player.stop()
        }
    }, 200)
}
