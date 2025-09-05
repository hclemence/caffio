import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Rating from "./Rating";

interface Props {
  title: string;
  rating: number;
}

const CafeListCard = ({ title, rating }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <Rating rating={rating} />
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default CafeListCard;
