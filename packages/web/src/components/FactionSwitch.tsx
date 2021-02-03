interface Props {
  isSelf: boolean
  displayName: string
  faction: number
  switch(): void
}

export const FactionSwitch = (props: Props) => {
  const content = (
    <div style={{ textAlign: props.faction === 0 ? 'left' : 'right' }}>
      <h2>{props.displayName}</h2>
      <h3>{props.faction}</h3>
    </div>
  )

  if (props.isSelf) {
    return (
      <div
        style={{
          cursor: 'pointer',
          textAlign: props.faction === 0 ? 'left' : 'right',
        }}
        onClick={props.switch}
      >
        {content}
        <button>{props.faction === 0 ? '>' : '<'}</button>
      </div>
    )
  }

  return content
}
