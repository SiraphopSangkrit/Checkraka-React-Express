import { Card,CardBody } from "@heroui/react"

interface BoxCardProps{
    children?: React.ReactNode;
}
export default function BoxCard({children}:BoxCardProps){

return(
<Card className="shadow-md">
      <CardBody>
      {children}
      </CardBody>
    </Card>
)
}